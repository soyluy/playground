import base64
import json
raw_first = "HmYkBwozJw4WNyAAFyB1VUcqOE1JZjUIBis7ABdmbU1GdGdfVXRnTRg="

first = base64.b64decode(raw_first)

def xor(a, b):
	if len(a) < len(b):
		a = a * (len(b) // len(a)) + a[:len(b) % len(a)]
	elif len(b) < len(a):
		b = b * (len(a) // len(b)) + b[:len(a) % len(b)]
	return bytes([a[i] ^ b[i] for i in range(len(a))])

def resolve_first(first):
	plain = '{"showpassword":"no","bgcolor":"#000000"}'
	key = "eDWo" # found by xoring the first with the plaintext
	decoded = xor(first, list(map(ord, key)))

	try:
		decoded = json.loads(decoded)
		print(decoded)
		return decoded
	except:
		print(f"Failed to decode with {plain}, {decoded}, {len(first)}")
		pass

def calculate_cookie(plain, key):
	encoded = xor(list(map(ord, plain)), list(map(ord, key)))
	return base64.b64encode(encoded).decode()

resolve_first(first)
plain = '{"showpassword":"yes","bgcolor":"#ffffff"}'
key = "eDWo"
print(calculate_cookie(plain, key)) # this gives the cookie for the next level
