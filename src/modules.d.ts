declare module 'querystring' {
  var exports: {
    default: {
      stringify: (s: {[k: string]: any}) => string,
      parse: (s: string) => {[k: string]: any},
    },
  }
  var stringify: (s: {[k: string]: any}) => string
  var parse: (s: string) => {[k: string]: any}
}

declare module 'vue2-google-maps' {
  var exports: {
    default: any
  }
}

declare module 'googlemaps'
