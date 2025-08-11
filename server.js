const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

// נתיבים לקבצים
const dataDir = path.join(__dirname, 'data');
const gradesPath = path.join(dataDir, 'grades.json');

// אתחול תיקיית נתונים
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(gradesPath)) fs.writeFileSync(gradesPath, '[]');

// פונקציות עזר
const readGrades = () => {
  try {
    return JSON.parse(fs.readFileSync(gradesPath, 'utf8'));
  } catch (err) {
    console.error('Error reading grades:', err);
    return [];
  }
};

const writeGrades = (grades) => {
  try {
    fs.writeFileSync(gradesPath, JSON.stringify(grades, null, 2));
  } catch (err) {
    console.error('Error writing grades:', err);
    throw err;
  }
};

// API Routes

// שמירת ציון חדש
app.post('/api/grades', (req, res) => {
  try {
    const { studentId, studentName, subject, score } = req.body;
    
    // אימות קלט
    if (!studentId || !studentName || !subject || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ error: 'Score must be between 0-100' });
    }

    const grades = readGrades();
    const newGrade = {
      id: Date.now().toString(),
      studentId,
      studentName,
      subject,
      score,
      date: new Date().toISOString()
    };
    
    grades.push(newGrade);
    writeGrades(grades);
    
    res.status(201).json({ success: true, data: newGrade });
  } catch (err) {
    console.error('Error saving grade:', err);
    res.status(500).json({ error: 'Failed to save grade' });
  }
});

// קבלת כל הציונים
app.get('/api/grades', (req, res) => {
  try {
    const grades = readGrades();
    res.json({ success: true, data: grades });
  } catch (err) {
    console.error('Error fetching grades:', err);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

// קבלת ציונים לפי תלמיד
app.get('/api/grades/:studentId', (req, res) => {
  try {
    const grades = readGrades();
    const studentGrades = grades.filter(g => g.studentId === req.params.studentId);
    
    if (studentGrades.length === 0) {
      return res.status(404).json({ error: 'No grades found for this student' });
    }
    
    res.json({ success: true, data: studentGrades });
  } catch (err) {
    console.error('Error fetching student grades:', err);
    res.status(500).json({ error: 'Failed to fetch student grades' });
  }
});

// קבלת ממוצעי תלמיד
app.get('/api/grades/:studentId/average', (req, res) => {
  try {
    const grades = readGrades();
    const studentGrades = grades.filter(g => g.studentId === req.params.studentId);
    
    if (studentGrades.length === 0) {
      return res.status(404).json({ error: 'No grades found for this student' });
    }
    
    const average = studentGrades.reduce((sum, grade) => sum + grade.score, 0) / studentGrades.length;
    
    res.json({ 
      success: true, 
      data: {
        studentId: req.params.studentId,
        studentName: studentGrades[0].studentName,
        average: parseFloat(average.toFixed(2)),
        count: studentGrades.length
      }
    });
  } catch (err) {
    console.error('Error calculating average:', err);
    res.status(500).json({ error: 'Failed to calculate average' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));