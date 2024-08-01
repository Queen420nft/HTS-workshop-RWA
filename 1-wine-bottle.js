import {
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    PrivateKey,
    Client,
    AccountId,
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
      const tokenCreateTxReceipt = await nftCreateTxResponse.getReceipt(client);
      console.log(
          `Status of token create transaction: ${tokenCreateTxReceipt.status.toString()}`,
      );
  
      // Get token id
      const tokenId = tokenCreateTxReceipt.tokenId;
      console.log(`Token id: ${tokenId.toString()}`);
  } catch (error) {
      console.log(error);
  }
  
    client.close();
  }
  
  main();
  