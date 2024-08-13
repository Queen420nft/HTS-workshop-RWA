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

  try {
    console.log("client: ", client)
  } catch (error) {
    console.log(error);
  }

  client.close();
}

main();
