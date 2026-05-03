    -- Drop section --
DROP TABLE IF EXISTS messages ;
DROP TABLE IF EXISTS logged_in_user ;
DROP TABLE IF EXISTS user ;

	-- CREATE TABLE section --
create table user(
    email varchar(50)  PRIMARY KEY,
    password varchar(50), 
    firstname varchar(20), 
    familyname varchar(20),
    gender varchar(6),
    city varchar(20), 
    country varchar(20)
);

create table logged_in_user(
    email varchar(50)  PRIMARY KEY,
    token varchar(100), 
    
    FOREIGN KEY(email) REFERENCES user(email)
);

create table messages(
    messageID INTEGER PRIMARY KEY AUTOINCREMENT,
    email varchar(50),              -- WALL ?
    emailsent varchar(50), 
    content varchar(50), 
    
    FOREIGN KEY (email) REFERENCES user(email)
);


-- TEST inserts:
INSERT INTO user VALUES('a@a.com', 'password', 'a', 'a', 'male', 'a', 'a');
INSERT INTO user VALUES('b@b.com', 'password', 'b', 'b', 'male', 'a', 'a');
INSERT INTO user VALUES('c@c.com', 'password', 'c', 'c', 'male', 'a', 'a');

