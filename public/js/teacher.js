// טיפול בהזנת ציון חדש
document.getElementById('gradeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const messageEl = document.getElementById('message');
  messageEl.textContent = '';
  messageEl.className = '';
  
  const grade = {
    studentId: document.getElementById('studentId').value.trim(),
    studentName: document.getElementById('studentName').value.trim(),
    subject: document.getElementById('subject').value.trim(),
    score: parseInt(document.getElementById('score').value)
  };

  try {
    const response = await fetch('/api/grades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(grade)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save grade');
    }

    messageEl.textContent = 'הציון נשמר בהצלחה!';
    messageEl.className = 'success';
    document.getElementById('gradeForm').reset();
  } catch (err) {
    messageEl.textContent = err.message;
    messageEl.className = 'error';
    console.error('Error:', err);
  }
});

// חיפוש ציונים
async function searchGrades() {
  const studentId = document.getElementById('searchInput').value.trim();
  const resultsDiv = document.getElementById('gradesResults');
  
  if (!studentId) {
    resultsDiv.innerHTML = '<div class="error">נא להזין תעודת זהות תלמיד</div>';
    return;
  }

  try {
    const response = await fetch(`/api/grades/${studentId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch grades');
    }

    if (data.data.length === 0) {
      resultsDiv.innerHTML = '<div>לא נמצאו ציונים עבור תלמיד זה</div>';
      return;
    }

    let html = `
      <h3>ציונים עבור ${data.data[0].studentName} (ת.ז. ${studentId})</h3>
      <table>
        <thead>
          <tr>
            <th>מקצוע</th>
            <th>ציון</th>
            <th>תאריך</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.data.forEach(grade => {
      const date = new Date(grade.date).toLocaleDateString('he-IL');
      html += `
        <tr>
          <td>${grade.subject}</td>
          <td>${grade.score}</td>
          <td>${date}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    // חישוב ממוצע
    const avgResponse = await fetch(`/api/grades/${studentId}/average`);
    const avgData = await avgResponse.json();

    if (avgResponse.ok) {
      html += `
        <div class="average">
          <strong>ממוצע ציונים:</strong> ${avgData.data.average} (מתוך ${avgData.data.count} ציונים)
        </div>
      `;
    }

    resultsDiv.innerHTML = html;
  } catch (err) {
    resultsDiv.innerHTML = `<div class="error">${err.message}</div>`;
    console.error('Error:', err);
  }
}