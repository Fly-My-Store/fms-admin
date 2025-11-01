'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BusinessConfiguration from 'sections/businesses/BusinessConfiguration';

export default function BusinessDetailsView() {

  return (
    <BusinessConfiguration />
  );
}