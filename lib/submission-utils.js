export function maskStudentName(name = "") {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "A***";
  }

  return `${trimmedName[0].toUpperCase()}***`;
}

export function previewAnswer(answer = "", length = 50) {
  const compactAnswer = answer.replace(/\s+/g, " ").trim();

  if (compactAnswer.length <= length) {
    return compactAnswer;
  }

  return `${compactAnswer.slice(0, length)}...`;
}
