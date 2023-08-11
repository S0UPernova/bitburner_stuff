import { NS } from '@ns';
import React from '/lib/react';
interface IMyContentProps {
  name: string
}

const MyContent = ({name}: IMyContentProps) => <><span>Hello {name}</span><img src='https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'/></>;

export async function main(ns: NS){
  ns.printRaw(<MyContent name="Michael"></MyContent>);
}