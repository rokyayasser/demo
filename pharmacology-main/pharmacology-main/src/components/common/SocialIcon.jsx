import React from 'react';
import styled from 'styled-components';

const SocialIcon = ({icon, platform, link, iconBg }) => {
  return (
    <StyledWrapper iconBg={iconBg}>
      <div className="light-button">
         <a href={link} target="_blank" rel="noopener noreferrer">
          <button className="bt">
            <div className="light-holder">
              <div className="dot" />
              <div className="light" />
            </div>
            <div className="button-holder">
              {icon}
              <p>{platform}</p>
            </div>
          </button>
        </a>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .light-button button.bt {
    position: relative;
    height: 200px;
    display: flex;
    align-items: flex-end;
    outline: none;
    background: none;
    border: none;
    cursor: pointer;
  }
  .light-button button.bt .button-holder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100px;
    width: 100px;
    background-color: #0a0a0a;
    border-radius: 5px;
    color: #0f0f0f;
    font-weight: 700;
    transition: 300ms;
    outline: #0f0f0f 2px solid;
    outline-offset: 20;
  }
  .light-button button.bt .button-holder svg {
    height: 50px;
    fill: #0f0f0f;
    transition: 300ms;
  }
  .light-button button.bt .light-holder {
    position: absolute;
    height: 200px;
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .light-button button.bt .light-holder .dot {
    position: absolute;
    top: 0;
    width: 10px;
    height: 10px;
    background-color: #0a0a0a;
    border-radius: 10px;
    z-index: 2;
  }
  .light-button button.bt .light-holder .light {
    position: absolute;
    top: 0;
    width: 200px;
    height: 200px;
    clip-path: polygon(50% 0%, 25% 100%, 75% 100%);
    background: transparent;
  }
  .light-button button.bt:hover .button-holder svg {
    fill: ${(props) => props.iconBg };
  }
  .light-button button.bt:hover .button-holder {
    color: ${(props) => props.iconBg };
    outline: rgba(88, 101, 242, 1) 2px solid;
    outline-offset: 2px;
  }
  .light-button button.bt:hover .light-holder .light {
    background: ${(props) => props.iconBg };
    background: linear-gradient(
      180deg,
      ${(props) => props.iconBg } 0%,
      ${(props) => props.iconBg } 50%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  .light-button button.bt:hover .button-holder svg path {
    fill: ${(props) => props.iconBg } ;
  }`;

export default SocialIcon;
