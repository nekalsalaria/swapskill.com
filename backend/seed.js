const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
require("dotenv").config();

const User = require("./models/User");

// ✅ Secure connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const firstNames = [
  "Aarav","Vivaan","Aditya","Arjun","Krishna","Ishaan","Rohan","Kunal","Rahul","Yash",
  "Ananya","Diya","Priya","Sneha","Kavya","Riya","Pooja","Megha","Simran","Neha"
];

const lastNames = [
  "Sharma","Verma","Mehta","Gupta","Agarwal","Singh","Jain","Bansal","Mishra","Chopra"
];

const skills = [
  "React","Node.js","MongoDB","Python","Java","DSA",
  "System Design","DevOps","Machine Learning","Next.js"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUser() {
  const first = getRandom(firstNames);
  const last = getRandom(lastNames);

  const name = `${first} ${last}`;
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random()*100)}@gmail.com`;

  const canTeach = getRandom(skills);
  let wantToLearn = getRandom(skills);

  while (wantToLearn === canTeach) {
    wantToLearn = getRandom(skills);
  }

  const experienceYears = faker.number.int({ min: 1, max: 5 });

  const about = `${canTeach} developer with ${experienceYears}+ years of experience. Passionate about building scalable applications and continuously learning new technologies.`;

  const price = faker.helpers.arrayElement([0, 199, 299, 499, 699]);

  const ratings = Array.from({ length: faker.number.int({ min: 1, max: 6 }) }).map(() => ({
    user: new mongoose.Types.ObjectId(),
    stars: faker.helpers.arrayElement([4,5]),
    createdAt: faker.date.recent()
  }));

  return {
    name,
    email,
    password: "$2b$10$realistichashedpassword",
    canTeach,
    wantToLearn,
    about,
    linkedin: `https://linkedin.com/in/${first.toLowerCase()}-${last.toLowerCase()}`,
    github: `https://github.com/${first.toLowerCase()}${last.toLowerCase()}`,
    website: "",
    pricePerHour: price,
    requests: [],
    acceptedRequests: [],
    chat: [],
    ratings
  };
}

async function seed() {
  try {
    await mongoose.connection;

    await User.deleteMany();

    const users = Array.from({ length: 100 }, generateUser);

    await User.insertMany(users);

    console.log("✅ 100 realistic users inserted");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();