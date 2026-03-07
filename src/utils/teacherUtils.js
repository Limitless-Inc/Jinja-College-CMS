import { supabase } from './supabase';

// Auto-expire duties that have passed their end date
export const expireOldDuties = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from('duty_assignments')
    .update({ status: 'expired' })
    .lt('end_date', today)
    .eq('status', 'active');
  
  if (error) {
    console.error('Error expiring duties:', error);
  }
};

// Check if teacher has active duty
export const checkTeacherDuty = async (teacherId) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('duty_assignments')
    .select('is_duty_head')
    .eq('teacher_id', teacherId)
    .eq('status', 'active')
    .lte('start_date', today)
    .gte('end_date', today)
    .single();
  
  if (error || !data) {
    return { hasDuty: false, isDutyHead: false };
  }
  
  return { hasDuty: true, isDutyHead: data.is_duty_head };
};

// Get fresh teacher data with all assignments
export const getTeacherWithAssignments = async (teacherId) => {
  // First expire old duties
  await expireOldDuties();
  
  // Get teacher data
  const { data: teacher, error: teacherError } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', teacherId)
    .single();
  
  if (teacherError || !teacher) {
    return null;
  }
  
  // Check duty status
  const dutyStatus = await checkTeacherDuty(teacherId);
  
  return {
    ...teacher,
    has_duty: dutyStatus.hasDuty,
    is_duty_head: dutyStatus.isDutyHead
  };
};

// Validate class assignment
export const validateClassAssignment = async (className) => {
  if (!className) return true; // Empty is valid (no assignment)
  
  const { data, error } = await supabase
    .from('classes')
    .select('id')
    .eq('name', className)
    .single();
  
  return !error && data;
};

// Check if class is already assigned to another teacher
export const isClassAlreadyAssigned = async (className, excludeTeacherId = null) => {
  if (!className) return false;
  
  let query = supabase
    .from('teachers')
    .select('id')
    .eq('class_assigned', className);
  
  if (excludeTeacherId) {
    query = query.neq('id', excludeTeacherId);
  }
  
  const { data, error } = await query.single();
  
  return !error && data;
};
