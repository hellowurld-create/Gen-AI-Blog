export function formatDate(dateString, options = {}) {
  const date = new Date(dateString);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return date.toLocaleDateString('en-US', formatOptions);
}

export function formatDateWithTime(dateString) {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
