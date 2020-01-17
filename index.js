const { createSocket } = require("dgram");
const client = createSocket("udp4");

// https://nodejs.org/docs/latest-v10.x/api/dgram.html

const DNSPORT = 53
const DNSHOST = '8.8.8.8'

client.on("error", err => {
  console.log(`client error:\n${err.stack}`);
  client.close();
});

client.on("message", (msg, rinfo) => {
  console.log(`client got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  client.close();
});

client.on("listening", () => {
  const address = client.address();
  console.log(`client listening ${address.address}:${address.port}`);
});

client.on("connect", () => {
  console.log("connected");
});

client.on("close", () => {
  console.log("close");
});

// first 12 bytes is header
// const rawMessage = Buffer.from('c8db01200001000000000001067562756e747503636f6d0000010001000029100000000000000c000a00084c0c840dad978896', 'hex')

// const testRes = Buffer.from('c8db81800001000600000001067562756e747503636f6d0000010001c00c00010001000000d500045bbd5a3ac00c00010001000000d500045bbd5a3bc00c00010001000000d500045bbd5967c00c00010001000000d500045bbd596ec00c00010001000000d500045bbd5976c00c00010001000000d500045bbd59730000290200000000000000')


const message = 'ubuntu.com'

client.send(encodeQuery(message), DNSPORT, DNSHOST, err => {
  if (err) console.log(err);
});



// input
// - domain
// - type
// - class
function encodeQuery(input) {
  // create header, hardcode 1 question
  const header = Buffer.alloc(12)

  // header
  header.writeUInt16BE(0x01) // id
  header.writeUInt16BE(0b0000000100000000, 2) // flags
  header.writeUInt16BE(0x01, 4) // questions count
  header.writeUInt16BE(0x00, 6) // answer count
  header.writeUInt16BE(0x00, 8) // authorative count
  header.writeUInt16BE(0x00, 10) // additonal count

  // questions
  let question = input
    .split('.')
    .map(name => Buffer.concat([Buffer.from([name.length]), Buffer.from(name)]))
    .reduce((names, name) => Buffer.concat([names, name]), Buffer.from([]))

  const questionEnd = Buffer.from([0x00])

  const qtype = Buffer.from([0x00, 0x01])
  const qclass = Buffer.from([0x00, 0x01])

  question = Buffer.concat([
    question,
    questionEnd,
    qtype,
    qclass,
  ])

  return Buffer.concat([header, question])
}
