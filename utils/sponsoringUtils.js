function generateSponsoringCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const codeLength = 7;
  let sponsoringCode = "";
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    sponsoringCode += characters[randomIndex];
  }
  return sponsoringCode;
}

module.exports = { generateSponsoringCode };
