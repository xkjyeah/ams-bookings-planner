
export default function () {
  return Date.now().toString(35).padStart(10, 'z') +
    Math.floor(Math.random() * 2e9).toString(35).padStart(7, 'z')
}