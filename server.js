import express from "express";
import cors from "cors";

import formRoutes from "./routes/formRoutes.js";

import {
  initializeEmbeddingModel
} from "./services/embeddingService.js";

import {
  initializeCanonicalEmbeddings
} from "./services/semanticMapper.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", formRoutes);

const PORT = 5000;

async function startServer() {

  try {

    console.log("Starting Semantic Interoperability Engine...");

    await initializeEmbeddingModel();

    await initializeCanonicalEmbeddings();

    app.listen(PORT, () => {

      console.log(
        `Server running at http://localhost:${PORT}`
      );

    });

  } catch (error) {

    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
}

startServer();