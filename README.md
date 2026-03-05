# Personal_Project_nodynote

WeHelp final stage personal project

# database

create table member(

-> id int primary key auto_increment,

-> username varchar(50) not null,

-> email varchar(100) not null,

-> password varchar(255) not null

-> );

# note

CREATE TABLE notes (

    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    content TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

);

# note_permissions

CREATE TABLE note_permissions (

    id INT AUTO_INCREMENT PRIMARY KEY,

    note_id INT NOT NULL,

    user_id INT NOT NULL,

    role ENUM('owner', 'editor') NOT NULL,

    CONSTRAINT fk_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES member(id) ON DELETE CASCADE,

    UNIQUE KEY unique_user_note (note_id, user_id)

);

alter table note_permissions modify column role ENUM('owner', 'editor',

'viewer')
