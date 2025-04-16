export function FormatDate(date, formato = "yyyy-MM-dd") {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let daDataTime;
  try {
    daDataTime = date.split("T")[0];
  } catch (error) {
    daDataTime = date;
  }

  let d = new Date(daDataTime);
  let month = "" + (d.getMonth() + 1);
  let monthstr = "" + monthNames[d.getMonth()];
  let day = "" + d.getDate();
  let year = "" + d.getFullYear();
  let hour = "";
  try {
    hour = "" + date.split("T")[1].split(":")[0];
  } catch (error) {}
  let minute = "";
  try {
    minute = "" + date.split("T")[1].split(":")[1];
  } catch (error) {}

  let second = "" + d.getSeconds();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  if (hour.length < 2) hour = "0" + hour;
  if (minute.length < 2) minute = "0" + minute;
  if (second.length < 2) second = "0" + second;

  var rr = "";
  formato = formato.replace("yyyy", year);
  formato = formato.replace("MMMM", monthstr);
  formato = formato.replace("MM", month);
  formato = formato.replace("dd", day);
  formato = formato.replace("hh", hour);
  formato = formato.replace("mm", minute);
  formato = formato.replace("ss", second);

  rr = formato;
  return rr;
}

export function dateAdd(data, days) {
  let date = new Date(data); /* (
    new Date(data).setDate(data.getDate() + days)
  ).toDateString(); */

  date.setDate(date.getDate() + days);

  return FormatDate(date, "yyyy-MM-dd");
}
