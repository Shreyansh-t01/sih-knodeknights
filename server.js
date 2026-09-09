import express from "express";
import cors from "cors";

import intelligenceRoutes from "./routes/intelligenceRoutes.js";

import {
  initializeEmbeddingModel
} from "./services/embeddingService.js";

import {
  initializeSemanticEngine
} from "./services/semanticEngine.js";


const app = express();

app.use(cors());

// Parse incoming JSON requests
app.use(
  express.json({
    limit: "5mb"
  })
);


app.get("/", (req, res) => {

  res.json({

    system:
      "SIH Semantic Interoperability Engine",

    status:
      "running",

    phase:
      "Phase 1 - Field Intelligence"

  });

});


app.use(
  "/api/intelligence",
  intelligenceRoutes
);


const PORT = 5000;


async function startServer() {

  try {

    console.log(
      "Starting SIH Intelligence Engine"
    );


    await initializeEmbeddingModel();


    await initializeSemanticEngine();



    app.listen(
      PORT,
      () => {

        console.log(
          `Server running at http://localhost:${PORT}`
        );

        console.log(
          `POST http://localhost:${PORT}/api/intelligence/analyze-form`
        );

      }
    );


  } catch (error) {

    console.error(
      "Server startup failed:",
      error
    );

    process.exit(1);

  }

}


startServer();