import React, { useState, useEffect } from 'react';
import { Button, FormCheck, Form, Row, Col } from 'react-bootstrap';

function ScoreSetting({ onSave, onClose, data }) {
  const [totalSets, setTotalSets] = useState(0);
  const [pointsPerSet, setPointsPerSet] = useState(0);
  const [isDeuceMatch, setIsDeuceMatch] = useState(false);
  const [deucePoints, setDeucePoints] = useState(0);

  useEffect(() => {
    if (data) {
      setTotalSets(data.totalSets || 0);
      setPointsPerSet(data.pointsPerSet || 0);
      setIsDeuceMatch(data.isDeuceMatch || false);
      setDeucePoints(data.deucePoints || 0);
    }
  }, [data]);

  const handleSave = () => {
    onSave({ totalSets, pointsPerSet, isDeuceMatch, deucePoints });
  };

  return (
    <Form className="score-setting-container">
      <Form.Group as={Row}>
        <Form.Label column sm={4}>
          Total Sets:
        </Form.Label>
        <Col sm={8}>
          <Form.Control type="number" value={totalSets} onChange={(e) => setTotalSets(e.target.value)} />
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Form.Label column sm={4}>
          Points per Set:
        </Form.Label>
        <Col sm={8}>
          <Form.Control type="number" value={pointsPerSet} onChange={(e) => setPointsPerSet(e.target.value)} />
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="deuceCheckbox">
        <Col sm={{ span: 8, offset: 4 }}>
          <FormCheck
            type="checkbox"
            label="Deuce Match"
            checked={isDeuceMatch}
            onChange={(e) => setIsDeuceMatch(e.target.checked)}
          />
        </Col>
      </Form.Group>
      {isDeuceMatch && (
        <Form.Group as={Row}>
          <Form.Label column sm={4}>
            Deuce Deciding Points:
          </Form.Label>
          <Col sm={8}>
            <Form.Control type="number" value={deucePoints} onChange={(e) => setDeucePoints(e.target.value)} />
          </Col>
        </Form.Group>
      )}
      <div className="button-container">
        <Button variant="primary" className="save-button" onClick={handleSave}>
          Save
        </Button>
        <Button variant="secondary" className="close-button" onClick={onClose}>
          Close
        </Button>
      </div>
    </Form>
  );
}

export default ScoreSetting;
