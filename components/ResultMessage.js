import React from 'react';

const ResultMessage = ({ result }) => {
  // Explicit styling with !important flags to ensure they take effect
  const containerStyle = {
    marginTop: '60px !important',
    marginBottom: '40px !important',
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  };

  const wrapperStyle = {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const headerStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '20px',
    color: '#1e40af'
  };

  const cardStyle = {
    backgroundColor: '#dbeafe',
    borderLeft: '8px solid #2563eb !important',
    borderRadius: '12px',
    color: '#1e3a8a',
    padding: '25px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2) !important',
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#047857'
  };

  const failedTitleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '10px',
    borderRadius: '6px 6px 0 0'
  };

  const paragraphStyle = {
    marginBottom: '15px'
  };

  const linkStyle = {
    color: '#2563eb',
    textDecoration: 'underline'
  };

  const signatureStyle = {
    marginTop: '20px',
    fontStyle: 'italic'
  };

  if (result === 'Passed' || result === 'Did Not Pass') {
    return (
      <div style={containerStyle}>
        <div style={wrapperStyle}>
          <div style={headerStyle}>Your Result</div>
          <div style={cardStyle}>
            {result === 'Passed' && (
              <>
                <div style={titleStyle}>Congratulations !!</div>
                <div style={paragraphStyle}>Very happy to hear about your results.</div>
                <div style={paragraphStyle}>Keep working hard and strive for greater success.<br />
                  <a href="https://www.cfainstitute.org/programs/cfa-program/candidate-resources/exam-day-preparation-guide" target="_blank" rel="noopener noreferrer" style={linkStyle}>cbt-candidate-path</a>
                </div>
                <div style={paragraphStyle}>
                  Watch the 1st lecture on YouTube. The syllabus is lengthy.<br />
                  <a href="https://www.youtube.com/channel/UCyt8himITSzS0U9ktWIxc8g/playlists" target="_blank" rel="noopener noreferrer" style={linkStyle}>YouTube</a>
                </div>
                <div style={signatureStyle}>- Aswini Bajaj</div>
              </>
            )}
            {result === 'Did Not Pass' && (
              <>
                <div style={failedTitleStyle}>Let's work hard again !!</div>
                <div style={paragraphStyle}>Please listen to the mentor note:<br />
                  <a href="" target="_blank" rel="noopener noreferrer" style={linkStyle}>Mentor Note</a>
                </div>
                <div style={paragraphStyle}>After that, fill out the analysis form. The output of the form shall be mailed to you.<br />
                  <a href="https://study.aswinibajaj.com/Introspect/" target="_blank" rel="noopener noreferrer" style={linkStyle}>Analysis Form</a>
                </div>
                <div style={paragraphStyle}>It is important to write down your thoughts.</div>
                <div style={paragraphStyle}>Don't get disheartened. Study well and practice more.</div>
                <div style={paragraphStyle}>Please make sure that you attach a screenshot of your result so that we can renew your lectures.</div>
                <div style={paragraphStyle}>We will also shift you from the old WhatsApp group to the new group. Please give us 5-7 working days.</div>
                <div style={paragraphStyle}>Meanwhile, start with the YouTube lectures:<br />
                  <a href="https://www.youtube.com/channel/UCyt8himITSzS0U9ktWIxc8g/playlists" target="_blank" rel="noopener noreferrer" style={linkStyle}>YouTube Channel</a>
                </div>
                <div style={signatureStyle}>- Aswini Bajaj</div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default ResultMessage; 