'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BusinessUserUpdateWizard from 'sections/businessUser/BusinessUserUpdateWizard';

export default function BusinessUserUpdateView() {

  return (
    <>
      <BusinessUserUpdateWizard />
    </>
  );
}