async function loadGrades() {
  const studentId = document.getElementById('studentId').value.trim();
  const studentInfoDiv = document.getElementById('studentInfo');
  const gradesList = document.getElementById('gradesList');
  const averageDisplay = document.getElementById('averageDisplay');
  
  // איפוס תצוגה
  studentInfoDiv.innerHTML = '';
  gradesList.innerHTML = '';
  averageDisplay.innerHTML = '';
  
  if (!studentId) {
    studentInfoDiv.innerHTML = '<div class="error">נא להזין תעודת זהות</div>';
    return;
  }

  try {
    // שליפת ציונים
    const gradesResponse = await fetch(`/api/grades/${studentId}`);
    const gradesData = await gradesResponse.json();

    if (!gradesResponse.ok) {
      throw new Error(gradesData.error || 'Failed to fetch grades');
    }

    if (gradesData.data.length === 0) {
      studentInfoDiv.innerHTML = '<div>לא נמצאו ציונים עבור תלמיד זה</div>';
      return;
    }

    // הצגת פרטי תלמיד
    studentInfoDiv.innerHTML = `
      <h3>${gradesData.data[0].studentName} (ת.ז. ${studentId})</h3>
    `;

    // הצגת ציונים
    gradesData.data.forEach(grade => {
      const date = new Date(grade.date).toLocaleDateString('he-IL');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${grade.subject}</td>
        <td>${grade.score}</td>
        <td>${date}</td>
      `;
      gradesList.appendChild(row);
    });

    // שליפת ממוצע
    const avgResponse = await fetch(`/api/grades/${studentId}/average`);
    const avgData = await avgResponse.json();

    if (avgResponse.ok) {
      averageDisplay.innerHTML = `
        <div class="average-box">
          <h4>ממוצע ציונים: ${avgData.data.average}</h4>
          <p>מתוך ${avgData.data.count} ציונים</p>
        </div>
      `;
    }
  } catch (err) {
    studentInfoDiv.innerHTML = `<div class="error">${err.message}</div>`;
    console.error('Error:', err);
  }
}