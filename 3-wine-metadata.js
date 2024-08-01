import {
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenType,
  TokenSupplyType,
  PrivateKey,
  Client,
  AccountId,
  Hbar,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);

  // If we weren't able to grab it, we should throw a new error
  if (operatorId == null || operatorKey == null) {
    throw new Error(
      "Environment variables operatorId and operatorKey must be present"
    );
  }

  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  // Generate a supply key
  const supplyKey = PrivateKey.generateED25519();

  // Create metadata for the wine bottle
  const metadata = {
    name: "Petrus",
    year: 1996,
    region: "Pomerol",
    country: "France",
    grape: "Merlot",
    alcohol: "13.5%",
    serial: "1234567890",
    image: "https://www.decantalo.com/fi/11862-product_img/petrus.jpg",
  };

  // however we have a JSON metadata schema called HIP-412 to standardize NFT metadata
  const structuredMetadata = {
    name: "Petrus",
    image: "https://www.decantalo.com/fi/11862-product_img/petrus.jpg",
    type: "image/jpg", // MIME type referring to image
    description: "1996 Pomerol, France, in good condition with cork intact",
    properties: {
      year: 1996,
      region: "Pomerol",
      country: "France",
      grape: "Merlot",
      alcohol: "13.5%",
      serial: "1234567890",
    },
    files: [
      {
        uri: "https://www.decantalo.com/product/images/4k-petrus.jpg",
        type: "image/jpg",
        is_default_file: true,
      },
    ],
  };

  // problem - only 100 bytes can be uploaded
  const cid = new TextEncoder().encode(
    "ipfs://QmVtvHUCbVdRpmg5YFtfaYuX5LtYgWhAGpoBG3tDTpyC58"
  );

  try {
    // Create a non fungible token
    let nftCreateTx = new TokenCreateTransaction()
      .setTokenName("Petrus")
      .setTokenSymbol("P1996")
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1)
      .setTreasuryAccountId(operatorId)
      .setSupplyKey(supplyKey)
      .freezeWith(client);

    // Sign and execute create token transaction
    const nftCreateTxSigned = await nftCreateTx.sign(operatorKey);
    const nftCreateTxResponse = await nftCreateTxSigned.execute(client);

    // Get receipt for create token transaction
    const nftCreateTxReceipt = await nftCreateTxResponse.getReceipt(client);
    console.log(
      `Status of NFT create transction: ${nftCreateTxReceipt.status.toString()}`
    );

    // Get token id
    const tokenId = nftCreateTxReceipt.tokenId;
    console.log(`Token id: ${tokenId.toString()}`);

    // Mint token
    const nftMintTx = new TokenMintTransaction()
      .setMetadata([cid])
      .setMaxTransactionFee(new Hbar(20))
      .setTokenId(tokenId)
      .freezeWith(client);

    const nftMintTxResponse = await (
      await nftMintTx.sign(supplyKey)
    ).execute(client);

    const nftMintTxReceipt = await nftMintTxResponse.getReceipt(client);
    console.log(
      `Status of NFT mint transaction: ${nftMintTxReceipt.status.toString()}`
    );

    // go to hashscan and show the minted serial -> there's no metadata or image
  } catch (error) {
    console.log(error);
  }

  client.close();
}

main();
