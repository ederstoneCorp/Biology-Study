export type SchoolForm = 1 | 2 | 3 | 4;

const STORAGE_KEY = "biology-study:school-form";

export function getSchoolForm(): SchoolForm {
  if (typeof window === "undefined") return 1;
  const saved = Number(localStorage.getItem(STORAGE_KEY));
  return saved === 2 || saved === 3 || saved === 4 ? saved : 1;
}

export function setSchoolForm(form: SchoolForm) {
  localStorage.setItem(STORAGE_KEY, String(form));
}

export function includesForm(selectedForm: SchoolForm, lessonForm?: SchoolForm) {
  // The selected form is the maximum level: Form 2 includes Forms 1–2, etc.
  return lessonForm != null && lessonForm <= selectedForm;
}
