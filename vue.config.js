module.exports = {
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = `TMS`
                return args
            })
    },
    devServer: {
        watchOptions: {
            ignored: /node_modules/,
            aggregateTimeout: 300,
            poll: 500
        }
    }
}
