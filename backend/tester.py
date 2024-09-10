import psycopg2

conn = psycopg2.connect(
    database="exampledb",
    user="docker",
    password="docker",
    host="localhost"
)

curr = conn.cursor()

curr.execute("SELECT * FROM users")

rows = curr.fetchall()

if not len(rows):
    print("Empty")

for row in rows:
    print(row)

curr.close()
conn.close()