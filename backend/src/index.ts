import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the Golf Master Trainer backend!');
});

// Get all golf courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await prisma.golfCourse.findMany();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get all scorecards for a user
app.get('/api/scorecards', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  try {
    const scorecards = await prisma.scorecard.findMany({
      where: { userId: String(userId) },
      include: {
        golfCourse: true,
        holeScores: true,
        postRoundAnswers: true,
      },
    });
    res.json(scorecards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scorecards' });
  }
});

// Get a single scorecard by id
app.get('/api/scorecards/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const scorecard = await prisma.scorecard.findUnique({
      where: { id },
      include: {
        golfCourse: true,
        holeScores: true,
        postRoundAnswers: true,
      },
    });
    if (!scorecard) {
      return res.status(404).json({ error: 'Scorecard not found' });
    }
    res.json(scorecard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scorecard' });
  }
});

// Create a new scorecard
app.post('/api/scorecards', async (req, res) => {
  const { userId, golfCourseId, roundType, weather, wind, holeScores, postRoundAnswers } = req.body;

  if (!userId || !golfCourseId) {
    return res.status(400).json({ error: 'userId and golfCourseId are required' });
  }

  try {
    const newScorecard = await prisma.scorecard.create({
      data: {
        userId,
        golfCourseId,
        roundType,
        weather,
        wind,
        holeScores: {
          create: holeScores,
        },
        postRoundAnswers: {
          create: postRoundAnswers,
        },
      },
      include: {
        holeScores: true,
        postRoundAnswers: true,
      }
    });
    res.status(201).json(newScorecard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create scorecard' });
  }
});


app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
