import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
    title: "Auth Service API",
    description: "Automatically generated Swagger Docs",
    version: "1.0.0"
    },
    host: "localhost:6001",
    schemes: ["http"],
    basePath: "/api"
}

const outputFile = "./swagger-output.json"
const endpointsFiles = ["./routes/auth.router.ts"]

const options = {
    openapi: "3.0.0",
    autoBody: true,
    autoHeaders: true,
    autoQuery: true
}

swaggerAutogen(options)(outputFile, endpointsFiles, doc)