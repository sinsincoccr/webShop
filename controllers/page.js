exports.renderProfile = (req, res, next) => {
    // 서비스를 호출
    res.render('profile', {title: '내정보 - nodeBird'});
};

exports.renderJoin = (req, res, next) => {
    res.render('join', {title: '회원 가입 - nodeBird'});
};

exports.renderMain = (req, res, next) => {
    res.render('main', {
        title: 'nodeBird',
        twits: [],
    });
};