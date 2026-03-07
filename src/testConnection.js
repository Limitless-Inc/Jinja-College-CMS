import { supabase } from './utils/supabase';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('count');
    
    if (error) {
      console.error('Connection ERROR:', error);
      return false;
    }
    
    console.log('Connection SUCCESS!', data);
    return true;
  } catch (err) {
    console.error('Connection FAILED:', err);
    return false;
  }
}

testConnection();
