import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { addDays } from 'date-fns';
import { useHistory } from 'react-router-dom';
import { Button, Card, Divider, Grid, Icon, Modal } from 'semantic-ui-react';

const getDateString = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const loc = `/timeline/${year}-${('0' + month).slice(-2)}-${('0' + day).slice(
    -2
  )}`;
  return loc;
};

const useOpenCloser = defOpen => {
  const [open, setOpen] = useState(defOpen);
  const makeOpen = useCallback(() => setOpen(true), [setOpen]);
  const makeClose = useCallback(() => setOpen(false), [setOpen]);
  return { open, makeOpen, makeClose };
};

export const TimelineFilter = props => {
  const { year, month, day } = props;
  const { open, makeOpen, makeClose } = useOpenCloser(false);
  const history = useHistory();

  const handleDayClick = useCallback(
    date => {
      history.push(getDateString(date));
      makeClose();
    },
    [history, makeClose]
  );

  const handleNextClick = useCallback(() => {
    const date = new Date(year, month - 1, day);
    history.push(getDateString(addDays(date, 1)));
  }, [year, month, day, history]);

  const handlePrevClick = useCallback(() => {
    const date = new Date(year, month - 1, day);
    history.push(getDateString(addDays(date, -1)));
  }, [year, month, day, history]);

  return (
    <>
      <Modal size="small" onClose={makeClose} open={open} basic>
        <Card centered raised>
          <Calendar
            value={new Date(year, month - 1, day)}
            onClickDay={handleDayClick}
          />
        </Card>
      </Modal>
      <Grid>
        <Grid.Column width={3}>
          <Button
            color="teal"
            icon="chevron left"
            fluid
            onClick={handlePrevClick}
          />
        </Grid.Column>
        <Grid.Column width={10}>
          <Button basic color="teal" onClick={makeOpen} fluid>
            <Icon name="calendar" />
            {new Date(
              Number(year),
              Number(month - 1),
              Number(day)
            ).toLocaleDateString()}
          </Button>
        </Grid.Column>
        <Grid.Column width={3}>
          <Button
            color="teal"
            icon="chevron right"
            fluid
            onClick={handleNextClick}
          />
        </Grid.Column>
      </Grid>
      <Divider />
    </>
  );
};

TimelineFilter.propTypes = {
  year: PropTypes.number.isRequired,
  month: PropTypes.number.isRequired,
  day: PropTypes.number.isRequired,
};
