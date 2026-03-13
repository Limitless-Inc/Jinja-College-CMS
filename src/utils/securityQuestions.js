export const SECURITY_QUESTIONS = [
  'What was the name of your first school?',
  'What is your mother\'s maiden name?',
  'What was the name of your childhood best friend?',
  'What town or village were you born in?',
  'What is the name of your favorite teacher?',
  'What was your first phone number?',
  'What is the first name of your oldest sibling?'
];

export const SECURITY_QUESTION_COLUMNS = [
  'security_question_1',
  'security_answer_1',
  'security_question_2',
  'security_answer_2',
  'security_questions_completed_at'
];

export const createEmptySecurityQuestionState = () => ({
  securityQuestion1: '',
  securityAnswer1: '',
  securityQuestion2: '',
  securityAnswer2: ''
});

export const normalizeSecurityAnswer = (value = '') =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');

export const hasSecurityQuestionsConfigured = (user) =>
  Boolean(
    user?.security_question_1 &&
      user?.security_question_2 &&
      user?.security_answer_1 &&
      user?.security_answer_2
  );

export const validateSecurityQuestionState = (data) => {
  if (
    !data.securityQuestion1 ||
    !data.securityAnswer1 ||
    !data.securityQuestion2 ||
    !data.securityAnswer2
  ) {
    return 'Please choose and answer both security questions.';
  }

  if (data.securityQuestion1 === data.securityQuestion2) {
    return 'Please choose two different security questions.';
  }

  if (normalizeSecurityAnswer(data.securityAnswer1).length < 2 || normalizeSecurityAnswer(data.securityAnswer2).length < 2) {
    return 'Security answers must be at least 2 characters long.';
  }

  return '';
};

export const buildSecurityQuestionPayload = (data) => ({
  security_question_1: data.securityQuestion1,
  security_answer_1: normalizeSecurityAnswer(data.securityAnswer1),
  security_question_2: data.securityQuestion2,
  security_answer_2: normalizeSecurityAnswer(data.securityAnswer2),
  security_questions_completed_at: new Date().toISOString()
});

export const isSecurityQuestionSchemaMissing = (error) => {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();

  return SECURITY_QUESTION_COLUMNS.some((column) => message.includes(column)) ||
    (message.includes('schema cache') && message.includes('teachers'));
};

export const getSecurityQuestionSchemaMessage = () =>
  'Recovery questions are not available yet because the database has not been updated. Run add_security_questions.sql in Supabase SQL Editor first.';

export const checkSecurityQuestionSchemaAvailability = async (supabase) => {
  const { error } = await supabase
    .from('teachers')
    .select('id, security_question_1')
    .limit(1);

  if (error) {
    if (!isSecurityQuestionSchemaMissing(error)) {
      console.error('Security question availability check failed:', error);
    }

    return false;
  }

  return true;
};