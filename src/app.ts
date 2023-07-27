import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line

app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200); // the 'status' is unnecessary but wanted to show you how to define a status
});

//Get (/dogs)
app.get("/dogs", async (req, res) => {
  const dogs = await prisma.dog.findMany();
  res.send(dogs);
});

// Get (/dogs/:id)
app.get("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  const dog = await prisma.dog.findUnique({
    where: {
      id,
    },
  });
  if (!dog) {
    return res.status(204).send({ error: "Nothing found" });
  }
  return res.send(dog);
});

//Post (/dogs)
app.post("/dogs", async (req, res) => {
  const body = req.body;
  const name = body?.name;
  const breed = body?.breed;
  const description = body?.description;
  const age = body?.age;
  if (typeof name !== "string") {
    return res.send({ error: "Name not a string" });
  }
  try {
    const newDog = await prisma.dog.create({
      data: {
        age,
        name,
        breed,
        description,
      },
    });
    res.status(201).send(newDog);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "No good" });
  }
});

// Patch (/dogs/:id)
app.patch("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  const dog = await prisma.dog.findUnique({
    where: {
      id,
    },
  });
  if (!dog) {
    return res.status(204).send({ error: "Nothing found" });
  }
  const updateDog = await prisma.dog.update({
    where: {
      id,
    },
    data: {
      ...dog,
      ...req.body,
    },
  });
  return res.send(updateDog);
});

// DELETE (/dogs/:id)
app.delete("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  const deleted = await Promise.resolve()
    .then(() =>
      prisma.dog.delete({
        where: {
          id,
        },
      })
    )
    .catch(() => null);
  if (deleted === null) {
    return res.status(404).send({ error: "dog not found" });
  }
  return res.status(200).send("Success");
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
