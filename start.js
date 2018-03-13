let express = require('express'),
    app = express(),
    server = require('http').createServer(app);

app.use('/webfonts', express.static(__dirname + '/webfonts'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/debug', express.static(__dirname + '/debug'));
app.use('/release', express.static(__dirname + '/release'));
app.use('*', function (req, res) {
    res.sendFile('index.html', {root: __dirname});
});

app.set('port', process.env.PORT || '3002');

server.listen(app.get('port'), function () {
    console.log(`приложение запущен http://localhost/section (порт ${app.get('port')})`);
});
