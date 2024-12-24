
import fs from 'fs';
import asyncHandler from '../middlewares/asyncHandler.js';

const filepath = "../services/data.json";

const fileContents = fs.readFileSync(filepath, 'utf-8');
const data = JSON.parse(fileContents);


const create = asyncHandler(async (req,res)=>{
    const {data} = req.body;
  

    // const user = {
    //     id: data.length + 1,
    //     name: req.body.name,
    //     department: req.body.department,
    //     date: req.body.date
    //   };
    
    //   data.push(user);
    //   fs.writeFileSync(filepath, JSON.stringify(data));

    const newItem = req.body;
    data.push(newItem);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    res.status(201).json(newItem);
})