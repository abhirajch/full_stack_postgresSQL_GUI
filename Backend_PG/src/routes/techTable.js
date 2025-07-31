import express from 'express'
import pool from '../configuration/dbconfig.js'
import authenticateToken from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/sql/execute/table', authenticateToken, async (req, res) => {
  const { query, database } = req.body;
  if (!query || !database) {
    return res.status(400).json({ error: 'Missing query or database name' });
  }
  const client = await pool.connect();
  try {
    const lowerQuery = query.trim().toLowerCase();
    if (!lowerQuery.startsWith('create table')) {
      return res.status(400).json({ error: 'Only CREATE TABLE queries are supported' });
    }
    const match = query.match(/create table\s+(\w+)/i);
    if (!match || !match[1]) {
      return res.status(400).json({ error: 'Unable to parse table name' });
    }
    const tableName = match[1];
    const openParenIndex = query.indexOf('(');
    const closeParenIndex = query.lastIndexOf(')');
    if (openParenIndex === -1 || closeParenIndex === -1 || closeParenIndex < openParenIndex) {
      return res.status(400).json({ error: 'Malformed CREATE TABLE query' });
    }
    const beforeColumns = query.slice(0, closeParenIndex);
    const afterColumns = query.slice(closeParenIndex);
    const modifiedQuery = `${beforeColumns}, dbname TEXT DEFAULT '${database}'${afterColumns}`;
    // Run the CREATE TABLE query
    await client.query(modifiedQuery);
    // Insert default row with dbname
    await client.query(`INSERT INTO "${tableName}" (dbname) VALUES ($1)`, [database]);
    res.status(200).json({
      message: `Table "${tableName}" created successfully with a default row.`,
    });
  } catch (error) {
    console.error('Error creating table or inserting row:', error);
    res.status(500).json({ error: 'Error executing query: ' + error.message });
  } finally {
    client.release();
  }
});

router.get('/databasql/tablesses/:dbname', authenticateToken, async (req, res) => {
  const dbName = req.params.dbname
  const client = await pool.connect()
  console.log(dbName)
  try {
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `)
    const allTables = tablesResult.rows.map(row => row.table_name)
    const relatedTables = []
    for (const tableName of allTables) {
      // Check if table has column named "dbname"
      const hasColumn = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = 'dbname'
      `, [tableName])
      if (hasColumn.rowCount > 0) {
        const safeName = `"${tableName.replace(/"/g, '""')}"`
        // Check if that table has any row where dbname = passed dbName
        const match = await client.query(
          `SELECT 1 FROM ${safeName} WHERE dbname = $1 LIMIT 1`,
          [dbName]
        )
        if (match.rowCount > 0) {
          relatedTables.push(tableName)
        }
      }
    }
    res.json({ tables: relatedTables })
  } catch (err) {
    console.error('Error fetching related tables:', err)
    res.status(500).json({ error: 'Failed to fetch related tables' })
  } finally {
    client.release()
  }
})

// Delete database entry and related table
router.delete('/sql/databases/:datname', authenticateToken, async (req, res) => {
  const userId = req.user.id
  const { datname } = req.params

  try {
    // Get database_id (or related table name if stored)
    const result = await pool.query(
      'SELECT id FROM user_databases_tech WHERE user_id = $1 AND datname = $2',
      [userId, datname]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Database not found' })
    }

    const dbId = result.rows[0].id
    const tableName = `data_${dbId}` // Assuming your table is named like this

    // Delete the table
    await pool.query(`DROP TABLE IF EXISTS ${tableName}`)

    // Delete the metadata entry
    await pool.query(
      'DELETE FROM user_databases_tech WHERE id = $1',
      [dbId]
    )

    res.json({ message: 'Database and table deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error deleting database' })
  }
})



export default router