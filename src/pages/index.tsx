import * as React from 'react';
import {
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
} from 'reactstrap';

const IndexPage = () => {
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');

  return (
    <>
      <Container>
        <Row>
          <Col md={{ size: 6, offset: 3 }}>
            <FormGroup>
              <Label for="username">Username</Label>
              <Input
                type="text"
                name="text"
                id="username"
                value={user}
                onChange={({ target }) => setUser(target.value)}
              />
              <Label for="password">Password</Label>
              <Input
                type="text"
                name="text"
                id="password"
                value={pass}
                onChange={({ target }) => setPass(target.value)}
              />
              <Button color="primary">Login</Button>
            </FormGroup>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default IndexPage;
