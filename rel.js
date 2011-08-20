jQuery(document).ready(function() {
    
    r = Raphael("holder", '100%', '100%');
    var x = 150;
    var y = 50;
    
    var lineheight = 36;
    
    var userNames = ['Bess', 'Kristen', 'Carl', 'Jon', 'Bob', 'Pat', 'Polina', 'Mike', 'Irene', 'Vivek', 'Jasmine', 'Vipul', 
        'Greg', 'Umais', 'Alice', 'Bill', 'Carol', 'Dave', 'Edgar', 'Frank', 'Greta', 'Hilda', 'Ida', 'Jack', 'Karin', 'Zack'];
    var users = _.map(userNames, function (name) {
        var user = rel.createUser(name, x, y);
        y += lineheight;
        return user;
    });
    
    x = 700;
    y = 50;
    
    var roleNames = ['Admin', 'Doctor', 'Nurse', 'Intern', 'Role 1', 'Role 2', 'Role 3', 'Role 4', 'Role 5', 'Role 6', 'Role 7', 
        'Role 8', 'Role 9', 'Role 10', 'Role 11', 'Role 12', 'Role 13', 'Role 14', 'Role 15', 'Role 16', 'Role 17', 'Role 18', 'Role 19' ];

    var roles = _.map(roleNames, function (name) {
        var role = rel.createRole(name, x, y);
        y += lineheight;
        
        return role;
    });
    
    _.each(roles, function (role) {
        _.each(users, function (user) {
            if (Math.floor(Math.random() * 4) === 0) {
                user.addRole(role);
            }
        });
    });
    
    _.each(users, function (user) {
        user.draw(r);
    });
    
    $('#canvas').css({
        'height', (y + 100) + 'px',
        'width', '900px'
    });
});
