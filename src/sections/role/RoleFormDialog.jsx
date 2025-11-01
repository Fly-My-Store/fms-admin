'use client';

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';

import {
  createPermissionRequest,
  updatePermissionRequest
} from 'store/rolePermission/rolePermissionSlice';
import { PERMISSION_NAMES } from 'utils/constants';
import RoleWizard from './RoleWizard';

export default function RoleFormDialog({ open, onClose, initialData = null }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <RoleWizard onClose={onClose} initialData={initialData}/>
    </Dialog>
  );
}