var RoomID = '1fa';
var afterEvent = {};

function openDialog(id) {
  $(id+' input[type=password]').val('');

  Avgrund.show(id);
}

function cancelDialog() {
  typeof afterEvent.revert == 'function' && afterEvent.revert();

  Avgrund.hide();
}

function checkPassword(userPassword, dbPassword, cb) {
  $.get('/utils/md5/'+userPassword).done(function(encPassword) {
    if (encPassword != dbPassword) {
      alert('당신 누구야? 비번이 다른데????');

      cb.call(this, false);
    } else {
      cb.call(this, true);
    }
  }.bind(this));
}

// 새로운 이벤트 생성을 위한 데이타 설정 후 다이얼로그 오픈
function newEventDialog(eventData) {
  $('#new-event input[name=title]').val('');
  $('#new-event input[name=owner]').val('');
  $('#new-event input[name=date]').val(eventData.date);
  $('#new-event input[name=start]').val(eventData.start);
  $('#new-event input[name=end]').val(eventData.end);

  openDialog('#new-event');
}

// 이벤트 수정을 위한 데이타 설정 후 다이얼로그 오픈
function updateEventDialog(event, delta, revert) {
  afterEvent = {
    _id: event._id,
    title: event.title,
    owner: event.owner,
    start: event.start.format('YYYY-MM-DD HH:mm:ss'),
    end: event.end.format('YYYY-MM-DD HH:mm:ss'),
    revert: typeof revert == 'function' ? revert : null,
    password: event.password
  };

  $('#confirm-edit input[name=start]').val(afterEvent.start);
  $('#confirm-edit input[name=end]').val(afterEvent.end);
  $('#confirm-edit input[name=title]').val(afterEvent.title);
  $('#confirm-edit input[name=owner]').val(afterEvent.owner);

  openDialog('#confirm-edit');
}

function updateEventData() {
  var password = $('#confirm-edit input[name=password]').val();

  afterEvent.title = $('#confirm-edit input[name=title]').val();
  afterEvent.owner = $('#confirm-edit input[name=owner]').val();

  if (afterEvent.title.trim() == '') {
    alert('제목이 필요합니다~');
    return;
  }

  if (afterEvent.owner.trim() == '') {
    alert('이름을.. 제발... 입력해 주세요.');
    return;
  }

  if (password.trim() == '') {
    alert('비밀 번호 없이 수정할 수 있을 것 같아요?');
    return;
  }

  checkPassword(password, afterEvent.password, function(match) {
    if (match) {
      Avgrund.hide();

      $.ajax({
        method: 'PUT',
        url: '/events/'+afterEvent._id,
        data: {
          title: afterEvent.title,
          owner: afterEvent.owner,
          start: afterEvent.start,
          end: afterEvent.end
        }
      }).done(function(data) {
        console.log('update!');
      });
    }
  });
}

function deleteEventData(event) {
  var password = $('#confirm-edit input[name=password]').val();

  if (password.trim() == '') {
    alert('비밀 번호 없이 삭제할 수 있을 것 같아요?');
    return;
  }

  if (confirm('정말 지워요?')) {
    checkPassword(password, afterEvent.password, function(match) {
      if (match) {
        $.ajax({
          method: 'DELETE',
          url: '/events/'+afterEvent._id,
        }).done(function(data) {
          $('#calendar').fullCalendar('removeEvents', afterEvent._id);
          Avgrund.hide();
        });
      }
    });
  }
}

function newEventData() {
  var eventData = {};

  eventData.title = $('#new-event input[name=title]').val();
  eventData.owner = $('#new-event input[name=owner]').val();
  eventData.start = $('#new-event input[name=date]').val() + ' ' + $('#new-event input[name=start]').val() + ':00';
  eventData.end = $('#new-event input[name=date]').val() + ' ' + $('#new-event input[name=end]').val() + ':00';
  eventData.password = $('#new-event input[name=password]').val();

  if (eventData.title.trim() == '') {
    alert('제목이 필요합니다~');
    return;
  }

  if (eventData.owner.trim() == '') {
    alert('이름을.. 제발... 입력해 주세요.');
    return;
  }

  if (eventData.password.trim() == '') {
    alert('비밀번호가 없으면 아무것도 할 수 없답니다.');
    return;
  }

  $.ajax({
    method: 'POST',
    url: '/events/'+RoomID,
    data: eventData,
  }).done(function(data) {
    eventData._id = data._id;
    eventData.password = data.password;

    $('#calendar').fullCalendar('renderEvent', eventData, true);
    $('#calendar').fullCalendar('unselect');

    Avgrund.hide();
  });
}

function loader(data) {
  $('#calendar').fullCalendar({
    header: {
      left: 'today prev,next',
      center: 'title',
      right: 'agendaDay,agendaWeek,month'
    },
    defaultDate: moment().format('YYYY-MM-DD'),
    defaultView: 'agendaWeek',
    editable: true,
    selectable: true,
    eventLimit: false,
    events: data,
    select: function(start, end) {
      newEventDialog({
        date: start.format('YYYY-MM-DD'),
        start: start.format('HH:mm'),
        end: end.format('HH:mm')
      });
    },
    eventClick: function(event) {
      updateEventDialog(event);
    },
    eventDrop: function(event, delta, revertFunc) {
      updateEventDialog(event, delta, revertFunc);
    },
    eventResize:  function(event, delta, revertFunc) {
      updateEventDialog(event, delta, revertFunc);
    },
    eventRender: function(event, element) {
      element.find('.fc-title').text(event.title + ' @' + event.owner);
    }
  });
}

function main() {
  $.get('/events/'+RoomID).done(loader);
}

$(document).ready(main);
