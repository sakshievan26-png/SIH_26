"""Deploy on your configured EVM network; requires a funded server-side key.

Run intentionally, once per journal. Never run on each app startup.
"""
import hashlib
import json
import os
from pathlib import Path
from web3 import Web3

ROOT = Path(__file__).resolve().parents[1]

def main():
    artifact = json.loads((ROOT / 'contracts/AuditAnchor.json').read_text())
    if artifact['source_sha256'] != hashlib.sha256((ROOT / 'contracts/AuditAnchor.sol').read_bytes()).hexdigest():
        raise ValueError('Source changed: recompile before deployment')
    w3 = Web3(Web3.HTTPProvider(os.environ['RPC_URL']))
    if w3.eth.chain_id != int(os.environ['CHAIN_ID']):
        raise ValueError('Wrong chain ID')
    account = w3.eth.account.from_key(os.environ['AUDIT_PRIVATE_KEY'])
    if w3.eth.get_transaction_count(account.address, 'pending') != w3.eth.get_transaction_count(account.address, 'latest'):
        raise RuntimeError('Account already has a pending transaction')
    contract = w3.eth.contract(abi=artifact['abi'], bytecode=artifact['bin'])
    tx = contract.constructor().build_transaction({'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address, 'pending'), 'chainId': w3.eth.chain_id})
    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    print('Deployment submitted:', w3.to_hex(tx_hash), flush=True)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    if receipt['status'] != 1:
        raise RuntimeError('Deployment reverted')
    print(json.dumps({'CONTRACT_ADDRESS': receipt['contractAddress'],
                      'DEPLOYMENT_BLOCK': receipt['blockNumber'], 'CHAIN_ID': w3.eth.chain_id}, indent=2))

if __name__ == '__main__': main()
