const dotenv = require('dotenv');
const webpack = require('webpack');

module.exports = (env, options) => {
    dotenv.config({
        path: './env/dev.env',
    });
    return {
        entry: ['@babel/polyfill', './index.js'],
        mode: 'development',

        plugins: [
            new webpack.DefinePlugin({
                'process.env.RIOT_API': JSON.stringify(process.env.RIOT_API),
            }),
        ],

        output: {
            path: __dirname + '/public',
            filename: 'bundle.js',
        },

        devServer: {
            historyApiFallback: true,
            inline: true,
            port: 9800,
            contentBase: __dirname + '/public',
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(png|jpg|gif)$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 8192,
                            },
                        },
                    ],
                },
                {
                    test: /\.less$/,
                    use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'less-loader',
                        },
                    ],
                },
                {
                    test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
                    use: ['raw-loader'],
                },
            ],
        },
    };
};
