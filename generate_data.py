# generate_data.py
# Gera dados sintéticos e exporta CSVs para carregar no Postgres e Neo4j.
# Requer: pip install pandas faker numpy

import csv, random, hashlib, json, os
from faker import Faker
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

fake = Faker('pt_BR')
OUT = 'output_csv'
os.makedirs(OUT, exist_ok=True)

N_CUSTOMERS = 500
N_ACCOUNTS = 600
N_MERCHANTS = 100
N_DEVICES = 300
DAYS = 14
TX_PER_DAY = 800  # média

# Customers
customers = []
for i in range(N_CUSTOMERS):
    customers.append({
        'id': i+1,
        'full_name': fake.name(),
        'doc': fake.cpf(),
        'created_at': fake.date_time_between(start_date='-2y', end_date='now').isoformat()
    })
pd.DataFrame(customers).to_csv(f'{OUT}/customer.csv', index=False)

# Accounts (uma conta por cliente, eventualmente extras)
accounts = []
acc_id = 1
for cust in customers:
    accounts.append({
        'id': acc_id,
        'customer_id': cust['id'],
        'opened_at': fake.date_time_between(start_date='-2y', end_date='now').isoformat(),
        'status': 'active',
        'risk_score': round(random.random()*20,2)
    })
    acc_id += 1
# adicionar algumas contas extras
for _ in range(N_ACCOUNTS - len(accounts)):
    accounts.append({
        'id': acc_id,
        'customer_id': random.choice(customers)['id'],
        'opened_at': fake.date_time_between(start_date='-2y', end_date='now').isoformat(),
        'status': 'active',
        'risk_score': round(random.random()*50,2)
    })
    acc_id += 1
pd.DataFrame(accounts).to_csv(f'{OUT}/account.csv', index=False)

# Merchants
merchants = []
for i in range(N_MERCHANTS):
    merchants.append({'id': i+1, 'name': fake.company(), 'mcc': str(random.randint(1000,9999)), 'region': fake.city()})
pd.DataFrame(merchants).to_csv(f'{OUT}/merchant.csv', index=False)

# Devices
devices = []
for i in range(N_DEVICES):
    fingerprint = hashlib.sha1(fake.uuid4().encode()).hexdigest()
    devices.append({'id': i+1, 'fingerprint_hash': fingerprint, 'first_seen_at': fake.date_time_between(start_date='-1y', end_date='now').isoformat(), 'risk_level': random.choice(['low','mid','high'])})
pd.DataFrame(devices).to_csv(f'{OUT}/device.csv', index=False)

# Transactions: gerar transações normais + inserir padrões de fraude (ciclos e fan-in)
transactions = []
tx_id = 1
start = datetime.now() - timedelta(days=DAYS)
account_ids = [a['id'] for a in accounts]
device_ids = [d['id'] for d in devices]
merchant_ids = [m['id'] for m in merchants]

def add_tx(src, dst, amount, ts, device=None, merchant=None):
    global tx_id
    transactions.append({
        'id': tx_id,
        'ts': ts.isoformat(),
        'src_account_id': src,
        'dst_account_id': dst,
        'merchant_id': merchant if merchant else random.choice(merchant_ids),
        'amount': round(amount,2),
        'channel': random.choice(['pix','ted','card','web','mobile']),
        'device_id': device if device else random.choice(device_ids),
        'location': fake.city(),
        'meta': json.dumps({'note': fake.sentence(nb_words=6)})
    })
    tx_id += 1

# transações normais
for day in range(DAYS):
    day_ts = start + timedelta(days=day)
    for _ in range(np.random.poisson(TX_PER_DAY)):
        src = random.choice(account_ids)
        dst = random.choice(account_ids)
        if src == dst: 
            continue
        ts = day_ts + timedelta(seconds=random.randint(0, 86399))
        add_tx(src, dst, random.uniform(5, 2000), ts)

# inserir ciclos suspeitos: escolher alguns grupos e criar ciclo A->B->C->A dentro de poucas horas
for i in range(5):
    a = random.choice(account_ids)
    b = random.choice([x for x in account_ids if x!=a])
    c = random.choice([x for x in account_ids if x not in (a,b)])
    base_ts = datetime.now() - timedelta(days=random.randint(0, DAYS-1), hours=random.randint(1,48))
    amount = round(random.uniform(1000,5000),2)
    add_tx(a,b,amount, base_ts)
    add_tx(b,c,amount*(1+random.uniform(-0.05,0.05)), base_ts + timedelta(hours=1))
    add_tx(c,a,amount*(1+random.uniform(-0.05,0.05)), base_ts + timedelta(hours=2))
    # marcar as contas como suspeitas (opcional) - we'll output labels later

# inserir fan-in: criar many senders para um destinatário específico
for i in range(3):
    dst = random.choice(account_ids)
    base_ts = datetime.now() - timedelta(days=random.randint(0, DAYS-1))
    for j in range(25):  # 25 remetentes diferentes em curto período
        src = random.choice([x for x in account_ids if x!=dst])
        ts = base_ts + timedelta(minutes=j*5)
        add_tx(src, dst, random.uniform(10,2000), ts)

pd.DataFrame(transactions).to_csv(f'{OUT}/transaction.csv', index=False)

# Relationships (shared device / ip between accounts)
relationships = []
for i in range(200):
    a = random.choice(account_ids)
    b = random.choice([x for x in account_ids if x!=a])
    relationships.append({'a_id': a, 'b_id': b, 'type': random.choice(['shared_device','shared_ip','shared_phone']), 'evidence': fake.phone_number(), 'first_seen_at': fake.date_time_between(start_date='-180d', end_date='now').isoformat()})
pd.DataFrame(relationships).to_csv(f'{OUT}/relationship.csv', index=False)

print('CSV gerados em', OUT)
