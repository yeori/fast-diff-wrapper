const countLines = (text: string, delim: string) => {
  let p = 0;
  let cnt = 0;
  while ((p = text.indexOf(delim, p)) >= 0) {
    cnt++;
    p += delim.length;
  }
  return cnt;
};

export default { countLines };
