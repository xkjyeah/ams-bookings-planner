let counter = 0

export default function () {
  counter += 1
  return 'id_' + (counter | 0)
}