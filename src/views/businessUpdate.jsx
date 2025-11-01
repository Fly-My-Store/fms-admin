'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BusinessWizard from 'sections/businesses/update/BusinessWizard';

export default function BusinessDetailsView() {

  return (
    <BusinessWizard />
  );
}