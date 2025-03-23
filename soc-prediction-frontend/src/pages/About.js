import React from "react";
import "./About.css";
import { FaLinkedin, FaGithub, FaYoutube } from "react-icons/fa";

// Demo profile image URL (Replace with actual images later)
const demoProfile =
  "https://www.w3schools.com/howto/img_avatar.png";

const teamMembers = [
  {
    name: "Manish S Khandagale",
    role: "Full-Stack Developer",
    github: "https://github.com/manishk",
    linkedin: "https://linkedin.com/in/yourprofile",
    youtube: "https://youtube.com/@yourchannel",
  },
  {
    name: "Akshay B Satoute",
    role: "Data Scientist",
    github: "https://github.com/manishk",
    linkedin: "https://linkedin.com/in/yourprofile",
    youtube: "https://youtube.com/@yourchannel",
  },
  {
    name: "Pradeep Rathod",
    role: "Data Analyst/Backend Developer",
    github: "https://github.com/manishk",
    linkedin: "https://linkedin.com/in/yourprofile",
    youtube: "https://youtube.com/@yourchannel",
  },
];

const About = () => {
  return (
    <div className="about">
      <h2>About Us</h2>
      <div className="team">
        {teamMembers.map((member, index) => (
          <div className="member" key={index}>
            <img src={demoProfile} alt="Profile" />
            <h3>{member.name}</h3>
            <p>{member.role}</p>
            <div className="social-icons">
              {member.linkedin !== "#" && (
                <a href={member.linkedin} target="_blank" rel="noreferrer">
                  <FaLinkedin />
                </a>
              )}
              {member.github !== "#" && (
                <a href={member.github} target="_blank" rel="noreferrer">
                  <FaGithub />
                </a>
              )}
              {member.youtube !== "#" && (
                <a href={member.youtube} target="_blank" rel="noreferrer">
                  <FaYoutube />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
