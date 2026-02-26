
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import connectDB from '../db/connectMongoDB.js';

dotenv.config();
await connectDB();
console.log('Mongo URI:(seeds)', process.env.MONGO_URI);
const mentors = [
  {
    fullName: 'Dr. Kavita Sharma',
    username: 'kavita_mentor',
    password: 'mentorPass123',
    email: 'kavita@example.com',
    userRole: 'Alumni',
    isAvailableForMentorship: true,
    collegeName: 'Delhi University',
    course: 'Economics',
    batchYear: 2015,
  },
  {
    fullName: 'Rahul Gupta',
    username: 'rahul_mentor',
    password: 'mentorRahul456',
    email: 'rahul@example.com',
    userRole: 'ALumni',
    isAvailableForMentorship: true,
    collegeName: 'IIT Bombay',
    course: 'Btech',
    batchYear: 2021,
  },
];

const seedMentors = async () => {
  try {
    await User.insertMany(mentors);
    console.log('Mentors seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding mentors:', error);
    process.exit(1);
  }
};

seedMentors();
