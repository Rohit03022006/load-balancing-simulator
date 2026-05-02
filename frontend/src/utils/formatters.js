export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return "-";
  return Number(value).toFixed(decimals);
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}m ${secs}s`;
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString();
};

export const truncateString = (str, length = 20) => {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
};
